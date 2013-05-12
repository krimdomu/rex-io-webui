package Rex::IO::WebUI;
use Mojo::Base "Mojolicious";

use File::Basename 'dirname';
use File::Spec::Functions 'catdir';
use Cwd 'getcwd';

our $VERSION = "0.0.8";

# This method will run once at server start
sub startup {
   my $self = shift;

   #######################################################################
   # for the package
   #######################################################################
   
   # Switch to installable home directory
   $self->home->parse(catdir(dirname(__FILE__), 'WebUI'));

   # Switch to installable "public" directory
   $self->static->paths->[0] = $self->home->rel_dir('public');

   # Switch to installable "templates" directory
   $self->renderer->paths->[0] = $self->home->rel_dir('templates');

   #######################################################################
   # Load configuration
   #######################################################################
   my @cfg = ("/etc/rex/io/webui.conf", "/usr/local/etc/rex/io/webui.conf", getcwd() . "/webui.conf");
   my $cfg;
   for my $file (@cfg) {
      if(-f $file) {
         $cfg = $file;
         last;
      }
   }
   print STDERR "CFG: $cfg\n";

   #######################################################################
   # Load plugins
   #######################################################################
   $self->plugin("Config", file => $cfg);
   $self->plugin("Rex::IO::WebUI::Mojolicious::Plugin::RexIOServer");
   $self->plugin("Rex::IO::WebUI::Mojolicious::Plugin::User");
   $self->plugin("Authentication" => {
      autoload_user => 1,
      session_key   => $self->config->{session}->{key},
      load_user     => sub {
         my ($app, $uid) = @_;
         my $user = $app->get_user($uid);
         return $user;
      },
      validate_user => sub {
         my ($app, $username, $password, $extra_data) = @_;
         my $user_data = $app->rexio->auth($username, $password);

         if($user_data) {
            return $user_data->{id};
         }

         return;
      },
   });

   #######################################################################
   # Configure routing
   #######################################################################
   my $r = $self->routes;

   $r->get("/login")->to("dashboard#login");
   $r->post("/login")->to("dashboard#login_do_auth");

   #my $r_auth = $r->route("/")->to(cb => sub {
   #   my ($app) = @_;
#
#      $app->redirect_to("/login") and return 0 unless($app->is_user_authenticated);
#      return 1;
#   });

   my $r_auth = $r->bridge("/")->to("dashboard#check_login");

   # Normal route to controller
   $r_auth->get("/")->to("dashboard#index");
   $r_auth->get("/dashboard")->to("dashboard#view");

   # server
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

   # search
   $r_auth->get("/search")->to("search#index");

   # dns
   $r_auth->get("/dns/#tld")->to("dns#show_tld");
   $r_auth->post("/dns/#domain/:type/#host")->to("dns#add_record");
   $r_auth->delete("/dns/#domain/:type/#host")->to("dns#del_record");
   $r_auth->post("/dns/#tld")->to("dns#update_tld_record");

   # dhcp
   $r_auth->get("/dhcp")->to("dhcp#show_leases");

   # templates
   $r_auth->get("/deploy/template")->to("deploy-template#show_templates");
   $r_auth->put("/deploy/template/:id")->to("deploy-template#update");
   $r_auth->get("/deploy/template/new")->to("deploy-template#create_new");
   $r_auth->post("/deploy/template")->to("deploy-template#post_new");

   # users and groups
   $r_auth->get("/user")->to("user#list");
   $r_auth->post("/user")->to("user#add");
   $r_auth->delete("/user/:user_id")->to("user#delete");

   $r_auth->get("/group")->to("group#list");
   $r_auth->post("/group")->to("group#add");
   $r_auth->post("/group/:group_id/user/:user_id")->to("group#add_user_to_group");
   $r_auth->delete("/group/:group_id")->to("group#delete");
}

1;
