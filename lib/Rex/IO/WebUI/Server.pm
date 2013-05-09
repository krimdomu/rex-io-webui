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

   Mojo::IOLoop->stream($self->tx->connection)->timeout(300);

   my $tx    = $self->tx;
   my $redis = Mojo::Redis->new(server => "localhost:6379");
   my $sub   = $redis->subscribe("rex_io_jobs", "rex_monitor");

   $sub->on(message => sub {
      my ($sub, $message, $channel) = @_;

      my $ref = Mojo::JSON->decode($message);

      if($channel eq "rex_monitor") {
         $ref->{cmd} = "monitor";
      }

      $tx->send(Mojo::JSON->encode($ref));
   });

   $self->on(finish => sub {
      $self->app->log->debug("Client disconnected: " . $self->tx->remote_address);
   });

   $self->on(message => sub {
      my ($tx, $message) = @_;
      $self->app->log->debug("Websockt Message: $message");
      $tx->send("Thanks for your message: " . $self->tx->remote_address);
   });

   $self->on(finish => sub {
      undef $redis;
      undef $sub;
      undef $tx;
   });
}

1;
