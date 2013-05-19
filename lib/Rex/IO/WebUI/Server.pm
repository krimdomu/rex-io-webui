package Rex::IO::WebUI::Server;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

use Mojo::Redis;
use Mojo::UserAgent;

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

sub bulk_view {
   my ($self) = @_;
   $self->render;
}

sub run_command {
   my ($self) = @_;
   $self->app->log->debug("Sending command to: " . $self->param("ip"));
   $self->app->log->debug(Dumper($self->req->json));
   $self->rexio->send_command_to($self->param("ip"), $self->req->json);

   $self->render_json({ok => Mojo::JSON->true});
}

sub messagebroker {
   my ($self) = @_;

   Mojo::IOLoop->stream($self->tx->connection)->timeout(300);
   my $outer_tx    = $self->tx;

   my $ua = Mojo::UserAgent->new;
   $ua->websocket("ws://localhost:5000/messagebroker", sub {
      my ($ua, $ua_tx) = @_;

      $ua_tx->on(message => sub {
         my ($tx, $msg) = @_;
         $self->app->log->debug("Got messagebroker message (from server)");
         $outer_tx->send($msg);
      });

      $self->on(message => sub {
         my ($tx, $msg) = @_;
         $self->app->log->debug("Got messagebroker message (from client): $msg");
         $ua_tx->send($msg);
      });

   });

   $self->on(finish => sub {
      undef $ua;
      undef $outer_tx;
   });
}

sub events {
   my ($self) = @_;

   $self->app->log->debug("Client connected: " . $self->tx->remote_address);

   Mojo::IOLoop->stream($self->tx->connection)->timeout(0);

   my $tx    = $self->tx;
   my $redis = Mojo::Redis->new(server => "localhost:6379");
   $redis->timeout(0);
   my $sub   = $redis->subscribe("rex_io_jobs", "rex_monitor", "rex_io_log", "rex_monitor:alerts", "rex_io_deploy");

   $redis->on(
      error => sub {
         $self->app->log->debug("Got redis error");
      },
      finish => sub {
         $self->app->log->debug("Got redis finish");
      },
   );

   $sub->on(message => sub {
      my ($sub, $message, $channel) = @_;

      my $ref = Mojo::JSON->decode($message);

      if($channel eq "rex_monitor") {
         $ref->{cmd} = "monitor";
      }

      if($channel eq "rex_monitor:alerts") {
         $ref->{cmd} = "alerts";
      }

      if($channel eq "rex_io_log") {
         $ref->{cmd} = "logstream";
      }

      $tx->send(Mojo::JSON->encode($ref));
   },
      error => sub {
         $self->app->log->debug("Got sub error");
      },
      finish => sub {
         $self->app->log->debug("Got sub finish");
      });

   $self->on(finish => sub {
      $self->app->log->debug("Client disconnected: " . $self->tx->remote_address);
   });

   $self->on(message => sub {
      my ($tx, $message) = @_;
      $self->app->log->debug("Websockt Message: $message");
      $tx->send("Thanks for your message: " . $self->tx->remote_address);
   });

   $self->on(
      error => sub {
         $self->app->log->debug("Got ERROR!");
      },
   );

   $self->on(finish => sub {
      $self->app->log->debug("Got FINISH!");
      undef $redis;
      undef $sub;
      undef $tx;
   });
}

sub group {
   my ($self) = @_;
   $self->render;
}

sub add_group {
   my ($self) = @_;
   my $ret = $self->rexio->add_server_group(%{ $self->req->json });

   $self->render_json($ret);
}

sub del_group {
   my ($self) = @_;
   my $ret = $self->rexio->del_server_group($self->param("group_id"));

   $self->render_json($ret);
}

sub add_server_to_group {
   my ($self) = @_;
   my $ret = $self->rexio->add_server_to_server_group($self->param("server_id"), $self->param("group_id"));
   
   $self->render_json($ret);
}

##### Rex.IO WebUI Plugin specific methods 
sub rexio_routes {
   my ($self, $routes) = @_;
   my $r      = $routes->{route};
   my $r_auth = $routes->{route_auth};

   $r->websocket("/server_events")->to("server#events");
   $r->websocket("/messagebroker")->to("server#messagebroker");
   $r_auth->get("/server/new")->to("server#add");
   $r_auth->get("/server/bulk")->to("server#bulk_view");
   $r_auth->post("/server/new")->to("server#add_new");
   $r_auth->get("/server/:id")->to("server#index");
   $r_auth->post("/server/:id")->to("server#update_server");
   $r_auth->post("/server/#ip/inventory")->to("server#trigger_inventory");
   $r_auth->post("/server/#ip/reboot")->to("server#trigger_reboot");
   $r_auth->get("/server")->to("server#list");
   $r_auth->post("/network-adapter/:id")->to("server#update_network_adapter");
   $r_auth->delete("/server/:hostid/tasks")->to("server#remove_all_tasks_from_server");
   $r_auth->post("/server/:hostid/task")->to("server#add_task_to_server");
   $r_auth->route("/server/:hostid/task/:taskid")->via("RUN")->to("server#run_task_on_host");
   $r_auth->route("/server/tasks")->via("RUN")->to("server#run_tasks");
   $r_auth->get("/server_group")->to("server#group");
   $r_auth->post("/server_group")->to("server#add_group");
   $r_auth->delete("/server_group/:group_id")->to("server#del_group");
   $r_auth->post("/server_group/server/:server_id/:group_id")->to("server#add_server_to_group");

   # set next boot // todo: andere url
   $r_auth->post("/server/:server/:boot")->to("server#set_next_boot");
   $r_auth->route("/server/#ip/command")->via("RUN")->to("server#run_command");
}

1;
