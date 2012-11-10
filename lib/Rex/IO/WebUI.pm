package Rex::IO::WebUI;
use Mojo::Base "Mojolicious";

# This method will run once at server start
sub startup {
   my $self = shift;

   # Documentation browser under "/perldoc"
   #$self->plugin("PODRenderer");
   $self->plugin("Rex::IO::WebUI::Mojolicious::Plugin::RexIOServer");

   # Router
   my $r = $self->routes;

   # Normal route to controller
   $r->get("/")->to("dashboard#index");
   $r->get("/dashboard")->to("dashboard#view");

   $r->get("/server/:id")->to("server#index");
   $r->post("/server/:server/:boot")->to("server#set_next_boot");

   # search
   $r->get("/search")->to("search#index");

   # dns
   $r->get("/dns/*tld")->to("dns#show_tld");
   $r->post("/dns/*tld")->to("dns#update_tld_record");

   # dhcp
   $r->get("/dhcp")->to("dhcp#show_leases");

   # templates
   $r->get("/deploy/template")->to("deploy-template#show_templates");
}

1;
