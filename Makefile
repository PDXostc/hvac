PROJECT = DNA_HVAC
INSTALL_FILES = images js icon.png index.html
WRT_FILES = DNA_common css icon.png index.html images setup config.xml js manifest.json README.txt
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

SEND := ~/send

ifndef TIZEN_IP
TIZEN_IP=TizenVTC
endif

wgtPkg: common
	zip -r $(PROJECT).wgt config.xml css icon.png index.html js DNA_common images

install_obs:
	mkdir -p ${DESTDIR}/opt/usr/apps/.preinstallWidgets
	cp -r DNA_HVAC.wgt ${DESTDIR}/opt/usr/apps/.preinstallWidgets

config:
	scp setup/weston.ini root@$(TIZEN_IP):/etc/xdg/weston/

$(PROJECT).wgt : dev

wgt:
	zip -r $(PROJECT).wgt $(WRT_FILES)

kill.xwalk:
	ssh root@$(TIZEN_IP) "pkill xwalk"

kill.feb1:
	ssh app@$(TIZEN_IP) "pkgcmd -k JLRPOCX008.HVAC"

run: install
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl  2>&1 | egrep -e 'Dashboard' | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d"

run.feb1: install.feb1
	ssh app@$(TIZEN_IP) "app_launcher -s JLRPOCX008.HVAC -d "

install.feb1: deploy
ifndef OBS
	-ssh app@$(TIZEN_IP) "pkgcmd -u -n JLRPOCX008.HVAC -q"
	ssh app@$(TIZEN_IP) "pkgcmd -i -t wgt -p /home/app/DNA_HVAC.wgt -q"
endif

install: deploy
ifndef OBS
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl  2>&1 | egrep -e 'Dashboard' | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -i /home/app/DNA_HVAC.wgt"
endif

$(PROJECT).wgt : wgt

deploy: wgtPkg
ifndef OBS
	scp $(PROJECT).wgt app@$(TIZEN_IP):/home/app
endif

common: /opt/usr/apps/common-apps
	cp -r /opt/usr/apps/common-apps DNA_common

dev-common: ../common-app
	cp -rf ../common-app DNA_common

all:
	@echo "Nothing to build"

clean:
	-rm -f $(PROJECT).wgt
	-rm -rf DNA_common
