#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:
  

package Rex::IO::WebUI::Log;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

##### Rex.IO WebUI Plugin specific methods 
sub rexio_routes {
  my ($self, $routes) = @_;
  my $r    = $routes->{route};
  my $r_auth = $routes->{route_auth};

}

1;
