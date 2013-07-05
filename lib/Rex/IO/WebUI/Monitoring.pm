#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   

package Rex::IO::WebUI::Monitoring;
use Mojo::Base 'Mojolicious::Controller';
use Mojo::JSON;
use Data::Dumper;

# This action will render a template
sub list {
   my ($self) = @_;
   $self->render;
}

sub add_group {
   my ($self) = @_;

   my $ref = $self->req->json;
   if(! exists $ref->{name}) {
      return $self->render_json({ok => Mojo::JSON->false, error => "name missing"}, status => 500);
   }

   my $ret = $self->rexio->add_monitoring_template(%{ $ref });
   $self->render_json($ret);
}

sub delete_group {
   my ($self) = @_;

   my $group_id = $self->param("group_id");
   my $ret = $self->rexio->del_monitoring_template($group_id);
   
   $self->render_json($ret);
}

sub list_mon_group {
   my ($self) = @_;

   my $group = $self->rexio->get_monitoring_template($self->param("groupid"));

   $self->stash("group", $group);

   $self->render;
}

sub add_monitoring_item {
   my ($self) = @_;

   my $ret = $self->rexio->add_monitoring_item($self->param("groupid"), %{ $self->req->json });

   $self->render_json($ret);
}

sub delete_monitoring_item {
   my ($self) = @_;
   
   my $ret = $self->rexio->del_monitoring_item($self->param("group_id"), $self->param("item_id"));

   $self->render_json($ret);
}

sub view_item {
   my ($self) = @_;

   my $group = $self->rexio->get_monitoring_template($self->param("group_id"));
   my $item  = $self->rexio->get_monitoring_item($self->param("group_id"), $self->param("item_id"));

   $self->stash(group => $group);
   $self->stash(item  => $item);

   $self->render;
}

sub update_item {
   my ($self) = @_;

   my $group_id = $self->param("group_id");
   my $item_id = $self->param("item_id");

   my $ret = $self->rexio->update_monitoring_item($group_id, $item_id, %{ $self->req->json });
   
   $self->render_json($ret);
}

sub add_group_to_host {
   my ($self) = @_;

   my $group_id = $self->param("group_id");
   my $host_id  = $self->param("host_id");

   my $ret = $self->rexio->add_monitoring_template_to_host($group_id, $host_id);

   $self->render_json($ret);
}

##### Rex.IO WebUI Plugin specific methods 
sub rexio_routes {
   my ($self, $routes) = @_;
   my $r      = $routes->{route};
   my $r_auth = $routes->{route_auth};

   $r_auth->get("/monitoring")->to("monitoring#list");
   $r_auth->post("/monitoring/group")->to("monitoring#add_group");
   $r_auth->delete("/monitoring/group/:group_id")->to("monitoring#delete_group");

   $r_auth->get("/monitoring/group/:groupid")->to("monitoring#list_mon_group");
   $r_auth->post("/monitoring/group/:groupid/item")->to("monitoring#add_monitoring_item");
   $r_auth->delete("/monitoring/group/:group_id/item/:item_id")->to("monitoring#delete_monitoring_item");
   $r_auth->get("/monitoring/group/:group_id/item/:item_id")->to("monitoring#view_item");
   $r_auth->post("/monitoring/group/:group_id/item/:item_id")->to("monitoring#update_item");
   $r_auth->post("/monitoring/group/:group_id/host/:host_id")->to("monitoring#add_group_to_host");
}

1;
