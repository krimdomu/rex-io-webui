%define perl_vendorlib %(eval "`%{__perl} -V:installvendorlib`"; echo $installvendorlib)
%define perl_vendorarch %(eval "`%{__perl} -V:installvendorarch`"; echo $installvendorarch)

%define real_name Rex-IO-WebUI

Summary: Rex.IO is a Bare-Metal-Deployer and an infrastructure management tool. (WebUI)
Name: rex-io-webui
Version: 0.2.15
Release: 1
License: Apache 2.0
Group: Utilities/System
Source: http://rex.io/downloads/Rex-IO-WebUI-0.2.15.tar.gz
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root
AutoReqProv: no

BuildRequires: perl >= 5.10.1
Requires: perl >= 5.10.1
Requires: perl-Mojolicious >= 4.0
Requires: perl-Mojolicious-Plugin-Authentication >= 1.24
Requires: perl-Mojo-Redis
Requires: perl-Compress-Zlib
Requires: perl-XML-Simple
Requires: perl-DBIx-Class
Requires: perl-DBD-MySQL
Requires: perl-Digest-Bcrypt
Requires: perl-DBIx-Class
Requires: perl-DBIx-Class-Tree
Requires: perl-Net-DNS
Requires: perl-Rex-IO-Client


%description
Rex.IO is a Bare-Metal-Deployer and an infrastructure management tool. WebUI component.

%prep
%setup -n %{real_name}-%{version}

%build
%{__perl} Makefile.PL INSTALLDIRS="vendor" PREFIX="%{buildroot}%{_prefix}"
%{__make} %{?_smp_mflags}

%install
%{__rm} -rf %{buildroot}
%{__make} pure_install

### Clean up buildroot
find %{buildroot} -name .packlist -exec %{__rm} {} \;


%clean
%{__rm} -rf %{buildroot}

%files
%defattr(-,root,root, 0755)
%doc META.yml 
%{_bindir}/*
%{perl_vendorlib}/*

%changelog

* Sun Oct 20 2013 Jan Gehring <jan.gehring at, gmail.com> 0.2.15-1
- initial package
