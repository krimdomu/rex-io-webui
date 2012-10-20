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

   # search
   $r->get("/search")->to("search#index");
}

1;
