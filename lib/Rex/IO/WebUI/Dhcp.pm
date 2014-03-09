package Rex::IO::WebUI::Dhcp;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

# This action will render a template
sub show_leases {
  my ($self) = @_;
  $self->render;
}

##### Rex.IO WebUI Plugin specific methods 
sub rexio_routes {
  my ($self, $routes) = @_;
  my $r    = $routes->{route};
  my $r_auth = $routes->{route_auth};

  $r_auth->get("/dhcp")->to("dhcp#show_leases");
}



1;
