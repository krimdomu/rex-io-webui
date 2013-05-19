package Rex::IO::WebUI::Deploy;
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

   my $ret = $self->rexio->add_os_template(%{ $self->req->json });

   $self->render_json($ret);
}


##### Rex.IO WebUI Plugin specific methods 
sub rexio_routes {
   my ($self, $routes) = @_;
   my $r      = $routes->{route};
   my $r_auth = $routes->{route_auth};

   $r_auth->get("/deploy/template")->to("deploy#show_templates");
   $r_auth->put("/deploy/template/:id")->to("deploy#update");
   $r_auth->get("/deploy/template/new")->to("deploy#create_new");
   $r_auth->post("/deploy/template")->to("deploy#post_new");
}


1;
