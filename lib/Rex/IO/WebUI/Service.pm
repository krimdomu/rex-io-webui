package Rex::IO::WebUI::Service;

use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

sub remove_all_tasks_from_server {
   my ($self) = @_;

   my $ret = $self->rexio->remove_all_tasks_from_host($self->param("hostid"));
   
   $self->render_json($ret);
}

sub add_task_to_server {
   my ($self) = @_;

   my $json = $self->req->json;
   my $host_id = $self->param("hostid");

   my $ret = $self->rexio->add_task_to_host(host => $host_id, task => $json->{task_id}, task_order => $json->{task_order});

   $self->render_json($ret);
}

sub run_task_on_host {
   my ($self) = @_;

   my $host_id = $self->param("hostid");
   my $task_id = $self->param("taskid");
}

sub run_tasks {
   my ($self) = @_;

   my $json = $self->req->json;

   my $ret = $self->rexio->run_tasks(@{ $json });

   $self->render_json($ret);
}

##### Rex.IO WebUI Plugin specific methods 
sub rexio_routes {
   my ($self, $routes) = @_;
   my $r      = $routes->{route};
   my $r_auth = $routes->{route_auth};

   $r_auth->delete("/server/:hostid/tasks")->to("service#remove_all_tasks_from_server");
   $r_auth->post("/server/:hostid/task")->to("service#add_task_to_server");
   $r_auth->route("/server/:hostid/task/:taskid")->via("RUN")->to("service#run_task_on_host");
   $r_auth->route("/server/tasks")->via("RUN")->to("service#run_tasks");
}


1;
