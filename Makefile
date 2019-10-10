CONTIKI_PROJECT = hello-world
MODULES += arch/dev/bme280

all: $(CONTIKI_PROJECT)
PLATFORMS_ONLY = zoul
CONTIKI = ..
include $(CONTIKI)/Makefile.include
