Name:       HomeScreenStartup
Summary:    A HTML Home Screen application
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org
Source0:    %{name}-%{version}.tar.bz2
Requires:  HomeScreen

%description
Auto Stratup of HomeSceen A proof of concept pure html5 UI

%prep
%setup -q -n %{name}-%{version}

%build

#make wgtPkg

%install
cp setup/poc_launcher.sh /usr/lib/systemd/system/
cp setup/poc.service /usr/lib/systemd/system/

%make_install

%post
systemctl enable poc

%postun

%files
%defattr(-,root,root,-)

