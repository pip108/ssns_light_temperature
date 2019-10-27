/*
 * Copyright (c) 2006, Swedish Institute of Computer Science.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the Institute nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 * This file is part of the Contiki operating system.
 *
 */

/**
 * \file
 *         A very simple Contiki application showing how Contiki programs look
 * \author
 *         Adam Dunkels <adam@sics.se>
 */

#include "contiki.h"
#include "contiki-lib.h"
#include "contiki-net.h"
#include "net/ipv6/uip.h"
#include "net/routing/rpl-classic/rpl.h"

#include "net/netstack.h"
#include "dev/zoul-sensors.h"
#include "dev/button-hal.h"
#include "dev/leds.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <math.h>

#include "net/ipv6/uip.h"
#include "net/ipv6/uip-ds6.h"
#include "net/ipv6/uiplib.h"

#include "simple-udp.h"
#include "dev/adc-sensors.h"
#include "sys/ctimer.h"
#include "dev/adc-zoul.h"

#define UDP_CLIENT_PORT 8765
#define UDP_SERVER_PORT 5678

#define ADC_PIN_LIGHT 5
#define ADC_PIN_TEMP 2

#ifndef UIP_IP_BUF
#define UIP_IP_BUF ((struct uip_ip_hdr *)&uip_buf[UIP_LLH_LEN])
#endif

static struct simple_udp_connection udp_conn;
static uip_ipaddr_t server_ipaddr;
static struct ctimer sensor_timer;
static struct ctimer blink_timer;
static uint8_t sensor_timer_value = 10;

static uint16_t light_value;
static uint16_t temp_value;

static void sendToServer(char *payload);
static void udp_rx_callback(struct simple_udp_connection *c,
                            const uip_ipaddr_t *sender_addr,
                            uint16_t sender_port,
                            const uip_ipaddr_t *receiver_addr,
                            uint16_t receiver_port,
                            const uint8_t *data,
                            uint16_t datalen);
static void sensor_timer_callback(void *ptr);
static void blink_timer_callback(void *ptr);

/*---------------------------------------------------------------------------*/
PROCESS(udp_server_process, "UDP Server process");
AUTOSTART_PROCESSES(&udp_server_process);

/*---------------------------------------------------------------------------*/
PROCESS_THREAD(udp_server_process, ev, data)
{
  PROCESS_BEGIN();

  adc_zoul.configure(SENSORS_HW_INIT, ZOUL_SENSORS_ADC_ALL);

  simple_udp_register(&udp_conn, UDP_SERVER_PORT, NULL, UDP_SERVER_PORT, udp_rx_callback);
  // fd00::212:4b00:14b5:ef07
  // fe80::be57:e7b2:a3ef:2399
  uip_ip6addr(&server_ipaddr, 0xfd00, 0, 0, 0x5000, 0, 0, 0, 1);
  //uip_ip6addr(&server_ipaddr, 0xfe80, 0xbe57, 0xe7b2, 0, 0, 0, 0xa3ef, 0x2399);
  ctimer_set(&sensor_timer, CLOCK_SECOND * sensor_timer_value, sensor_timer_callback, NULL);

  while (1)
  {
    PROCESS_YIELD();
    if (ev == button_hal_release_event)
    {
    }
  }

  PROCESS_END();
}

static void sendToServer(char *payload)
{
  simple_udp_sendto(&udp_conn, (uint8_t *)payload,
                    strlen(payload), &server_ipaddr);
  leds_on(LEDS_GREEN);
  ctimer_set(&blink_timer, CLOCK_SECOND, blink_timer_callback, "g");
}

static void udp_rx_callback(struct simple_udp_connection *c,
                            const uip_ipaddr_t *sender_addr,
                            uint16_t sender_port,
                            const uip_ipaddr_t *receiver_addr,
                            uint16_t receiver_port,
                            const uint8_t *data,
                            uint16_t datalen)
{
  char *msg = (char *)data;
  printf("%s\n", msg);

  char *parts[2];
  parts[0] = strtok(msg, " ");
  parts[1] = strtok(NULL, " ");

  bool op = false;
  if (strcmp(parts[0], "set_timer") == 0 && parts[1] != NULL)
  {
    uint8_t set_timer = atoi(parts[1]);
    if (set_timer > 0) {
      sensor_timer_value = set_timer;
      printf("setting sensor timer to %u", sensor_timer_value);
      leds_on(LEDS_BLUE);
      op = true;
    }
  }
  if (op) {
    // blink to confirm command
    ctimer_set(&blink_timer, CLOCK_SECOND, blink_timer_callback, "b");
  }
}

static void sensor_timer_callback(void *ptr)
{
  ctimer_set(&sensor_timer, CLOCK_SECOND * sensor_timer_value, sensor_timer_callback, NULL);
  char buf[80];
  light_value = adc_zoul.value(ZOUL_SENSORS_ADC1);
  temp_value = adc_zoul.value(ZOUL_SENSORS_ADC3);

  snprintf(buf, 80, "{\"light\":\"%u\",\"temp\":\"%u\"}",
           (unsigned int)(light_value),
           (unsigned int)(temp_value));
  sendToServer(buf);
}

static void blink_timer_callback(void *ptr)
{
  if (strcmp((char*)ptr, "r") == 0) {
    leds_off(LEDS_RED);
  }
  else if (strcmp((char *)ptr, "g") == 0) {
    leds_off(LEDS_GREEN);
  } else {
    leds_off(LEDS_BLUE);
  }
}
