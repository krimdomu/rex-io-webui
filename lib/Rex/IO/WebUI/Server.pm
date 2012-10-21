package Rex::IO::WebUI::Server;
use Mojo::Base 'Mojolicious::Controller';

sub index {
   my $self = shift;

   my $server = $self->rexio->get_server($self->param("id"));
   $self->stash("server", $server);

   $self->render;
}

1;
