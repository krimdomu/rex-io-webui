package Rex::IO::WebUI::Dhcp;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

# This action will render a template
sub show_leases {
   my ($self) = @_;
   $self->render;
}

1;
