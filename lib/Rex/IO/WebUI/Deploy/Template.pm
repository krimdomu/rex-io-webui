package Rex::IO::WebUI::Deploy::Template;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

use Mojo::JSON;

# This action will render a template
sub show_templates {
   my ($self) = @_;
   $self->render;
}

sub update {
   my ($self) = @_;

   my $ret = $self->rexio->save_deploy_os($self->param("id"), %{ $self->req->json });
   $self->render_json($ret);
}

sub create_new {
   my ($self) = @_;
   $self->render;
}

sub post_new {
   my ($self) = @_;
   $self->render_json({ok => Mojo::JSON->true});
}

1;
