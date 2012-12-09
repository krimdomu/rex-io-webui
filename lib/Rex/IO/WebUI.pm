package Rex::IO::WebUI;
use Mojo::Base "Mojolicious";

# This method will run once at server start
sub startup {
   my $self = shift;

   # Documentation browser under "/perldoc"
   #$self->plugin("PODRenderer");

   my @cfg = ("/etc/rex/io/webui.conf", "/usr/local/etc/rex/io/webui.conf", "webui.conf");
   my $cfg;
   for my $file (@cfg) {
      if(-f $file) {
         $cfg = $file;
         last;
      }
   }
   $self->plugin('Config', file => $cfg);

   $self->plugin("Rex::IO::WebUI::Mojolicious::Plugin::RexIOServer");

   # Router
   my $r = $self->routes;

   # Normal route to controller
   $r->get("/")->to("dashboard#index");
   $r->get("/dashboard")->to("dashboard#view");

   # server
   $r->get("/server/new")->to("server#add");
   $r->post("/server/new")->to("server#add_new");
   $r->get("/server/:id")->to("server#index");
   $r->post("/server/:id")->to("server#update_server");
   $r->post("/server/#ip/inventory")->to("server#trigger_inventory");
   $r->post("/server/#ip/reboot")->to("server#trigger_reboot");
   $r->post("/server/:server/:boot")->to("server#set_next_boot");
   $r->get("/server")->to("server#list");
   $r->post("/network-adapter/:id")->to("server#update_network_adapter");

   # search
   $r->get("/search")->to("search#index");

   # dns
   $r->get("/dns/#tld")->to("dns#show_tld");
   $r->post("/dns/#domain/:type/#host")->to("dns#add_record");
   $r->delete("/dns/#domain/:type/#host")->to("dns#del_record");
   $r->post("/dns/#tld")->to("dns#update_tld_record");

   # dhcp
   $r->get("/dhcp")->to("dhcp#show_leases");

   # templates
   $r->get("/deploy/template")->to("deploy-template#show_templates");
   $r->put("/deploy/template/:id")->to("deploy-template#update");
   $r->get("/deploy/template/new")->to("deploy-template#create_new");
   $r->post("/deploy/template")->to("deploy-template#post_new");
}

1;
