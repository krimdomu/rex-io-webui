package Rex::IO::WebUI;
use Mojo::Base 'Mojolicious';

# This method will run once at server start
sub startup {
   my $self = shift;

   # Documentation browser under "/perldoc"
   $self->plugin('PODRenderer');
   $self->plugin("Rex::IO::WebUI::Mojolicious::Plugin::RexIOServer");

   # Router
   my $r = $self->routes;

   # Normal route to controller
   $r->get("/")->to("dashboard#index");
   $r->get("/server/tree/root")->to("server-tree#root");
   $r->get("/server/tree/:name/*")->to("server-tree#child");

   # edit server
   $r->get("/server/:name/edit")->to("server#edit");
   $r->get("/server/:name/service/:service/*")->to("server#edit_service_key");
}

1;
