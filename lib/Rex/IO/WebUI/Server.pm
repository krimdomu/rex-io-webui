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

sub add {
   my ($self) = @_;
   $self->render;
}

sub add_new {
   my ($self) = @_;

   my $json = $self->req->json;
   my $mac = $json->{mac};
   delete $json->{mac};
   my $ret = $self->rexio->add_server($mac, %{ $json });

   $self->render_json($ret);
}

sub update_network_adapter {
   my ($self) = @_;

   my $ret = $self->rexio->update_network_adapter($self->param("id"), %{ $self->req->json });

   $self->render_json($ret);
}

sub update_server {
   my ($self) = @_;

   my $ret = $self->rexio->update_server($self->param("id"), %{ $self->req->json });

   $self->render_json($ret);
}

sub trigger_inventory {
   my ($self) = @_;

   my $ret = $self->rexio->trigger_inventory($self->param("ip"));

   $self->render_json($ret);
}

sub trigger_reboot {
   my ($self) = @_;

   my $ret = $self->rexio->trigger_reboot($self->param("ip"));

   $self->render_json($ret);
}

sub bulk_view {
   my ($self) = @_;
   $self->render;
}

1;
