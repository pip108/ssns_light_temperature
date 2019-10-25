CONTIKI_PROJECT = ssns_light_temperature
MODULES += arch/dev/bme280

all: $(CONTIKI_PROJECT)
PLATFORMS_ONLY = zoul
CONTIKI = ..
include $(CONTIKI)/Makefile.include
