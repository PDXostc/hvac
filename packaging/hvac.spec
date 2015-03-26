Name:       HVAC
Summary:    A HTML HelloTizen application
Version:    1.0
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2

BuildRequires:  common-apps
BuildRequires:  zip
BuildRequires:  desktop-file-utils

Requires: pkgmgr
Requires: crosswalk
Requires: tizen-extensions-crosswalk
Requires: pkgmgr-server
Requires: model-config-ivi
Requires: tizen-middleware-units
Requires: tizen-platform-config

%description
A proof of concept pure html5 UI

%prep
%autosetup

%build
make %{?_smp_mflags} wgtPkg

%install
make %{?_smp_mflags} install_obs "OBS=1" DESTDIR="%{buildroot}"

%post
su app -c "pkgcmd -i -t wgt -p /opt/usr/apps/.preinstallWidgets/JLRPOCX008.HVAC.wgt -q"

%postun
su app -c "pkgcmd -u -n JLRPOCX008.HVAC"

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/JLRPOCX008.HVAC.wgt
