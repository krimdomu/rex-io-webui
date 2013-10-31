Summary: Rex.IO - WebUI
Name: rex-io-webui
Version: 0.2.21
Release: 1
License: Apache 2.0
Group: Utilities/System
Source: http://rex.io/downloads/rex-io-webui-0.2.21.tar.gz
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root
AutoReqProv: no

BuildRequires: rexio-perl >= 5.18.0
BuildRequires: rexio-perl-YAML >= 0.84
BuildRequires: rexio-perl-Rex-IO-Client >= 0

Requires: rexio-perl >= 5.18.0
Requires: rexio-perl-YAML >= 0.84
Requires: rexio-perl-Rex-IO-Client >= 0

%description
Rex.IO is a Bare-Metal-Deployer and an infrastructure management tool.

%prep
%setup -n %{name}-%{version}


%install
%{__rm} -rf %{buildroot}
%{__mkdir} -p %{buildroot}/srv/rexio/webui
%{__mkdir} -p %{buildroot}/etc/init.d
%{__cp} -R {bin,lib,t,local} %{buildroot}/srv/rexio/webui
%{__cp} doc/rex-io-webui.init %{buildroot}/etc/init.d/rex-io-webui
%{__chmod} 755 %{buildroot}/etc/init.d/rex-io-webui

### Clean up buildroot
find %{buildroot} -name .packlist -exec %{__rm} {} \;

%pre

# create rex.io user if not there
if ! id rexio >/dev/null 2>&1; then
	groupadd -r rexio &>/dev/null
	useradd -r -d /srv/rexio -c 'Rex.IO Service User' -g rexio -m rexio &>/dev/null
fi

%post

/bin/chown -R rexio. /srv/rexio

%clean
%{__rm} -rf %{buildroot}

%files
%defattr(-,root,root, 0755)
/srv/rexio/webui
/etc/init.d/rex-io-webui

%changelog

* Thu Jul 25 2013 Jan Gehring <jan.gehring at, gmail.com> 0.2.21-1
- initial packaged

