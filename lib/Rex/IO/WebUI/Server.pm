package Rex::IO::WebUI::Server;
use Mojo::Base 'Mojolicious::Controller';

sub index {
   my $self = shift;
   $self->render;
}

1;
