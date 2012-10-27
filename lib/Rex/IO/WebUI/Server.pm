package Rex::IO::WebUI::Server;
use Mojo::Base 'Mojolicious::Controller';

sub index {
   my $self = shift;

   my $server = $self->rexio->get_server($self->param("id"));
   my $os_templates = $self->rexio->list_os_templates;

   $self->stash("server", $server);
   $self->stash("os_templates", $os_templates);

   $self->render;
}

1;
