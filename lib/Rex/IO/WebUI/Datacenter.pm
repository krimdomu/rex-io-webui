package Rex::IO::WebUI::Datacenter;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use MIME::Base64;

sub get_locations {
  my ($self) = @_;
  $self->render;
}

sub get_racks {
  my ($self) = @_;
  $self->render;
}

##### Rex.IO WebUI Plugin specific methods 
sub rexio_routes {
  my ($self, $routes) = @_;
  my $r    = $routes->{route};
  my $r_auth = $routes->{route_auth};

  $r_auth->get("/datacenter/locations")->to("datacenter#get_locations");
  $r_auth->get("/datacenter/racks")->to("datacenter#get_racks");
}


1;
