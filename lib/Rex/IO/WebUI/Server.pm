package Rex::IO::WebUI::Server;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

sub index {
   my ($self) = @_;

   my $server = $self->rexio->get_server($self->param("id"));
   my $os_templates = $self->rexio->list_os_templates;

   $self->stash("server", $server);
   $self->stash("os_templates", $os_templates);

   $self->render;
}

sub set_next_boot {
   my ($self) = @_;

   my $data = $self->rexio->set_next_boot(server => $self->param("server"), boot => $self->param("boot"));
   $self->render_json($data);
}

sub list {
   my ($self) = @_;
   $self->render;
}

1;
