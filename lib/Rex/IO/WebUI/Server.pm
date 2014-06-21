package Rex::IO::WebUI::Server;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

use Mojo::Redis;
use Mojo::UserAgent;
use Mojo::JSON 'j';

sub index {
  my ($self) = @_;

  if ( !$self->has_permission('UI_VIEW_SERVER') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  $self->render_later;

  my $server = $self->rexio->call( "GET", "1.0", "hardware",
    hardware => $self->param("id") );

  $self->app->log->debug("Got server data:");
  $self->app->log->debug( Dumper($server) );

  $self->stash( "server", $server->{data} );

  my $agent_ip;
  my $is_online = 0;
  for my $dev ( @{ $server->{data}->{network_adapters} } ) {
    next unless $dev->{ip};
    next if ( $dev->{ip} =~ m/^127\./ && $dev->{dev} =~ m/^lo/ );
    my $check = $self->rexio->call(
      "GET", "1.0", "messagebroker",
      client => $dev->{ip},
      online => undef
    );
    if ( $check->{ok} ) { $is_online = 1; $agent_ip = $dev->{ip}; last; }
  }

  $self->stash( "agent_ip",  $agent_ip );
  $self->stash( "is_online", $is_online );

  my ( @more_tabs, @more_content, @information_plugins, @plugin_menus,
    @plugin_filter, @plugin_general_information, @plugin_menu_configuration );

  # load server tabs from plugins
  for my $plugin ( @{ $self->config->{plugins} } ) {
    my $template_path = "\L$plugin";
    my $template_tab =
      $self->render_to_string( "$template_path/ext/server_tabs", partial => 1 );
    if ($template_tab) {
      push @more_tabs, $template_tab;
    }

    my $template_content =
      $self->render_to_string( "$template_path/ext/server_tabs_content",
      partial => 1 );
    if ($template_content) {
      push @more_content, $template_content;
    }

    my $information_content =
      $self->render_to_string( "$template_path/ext/server_tabs_information",
      partial => 1 );
    if ($information_content) {
      push @information_plugins, $information_content;
    }

    my $menu_content =
      $self->render_to_string( "$template_path/ext/server_menu", partial => 1 );
    if ($menu_content) {
      push @plugin_menus, $menu_content;
    }

    my $menu_configuration_content =
      $self->render_to_string( "$template_path/ext/server_menu_configuration",
      partial => 1 );
    if ($menu_configuration_content) {
      push @plugin_menu_configuration, $menu_configuration_content;
    }

    my $gen_info_content =
      $self->render_to_string( "$template_path/ext/server_general_information",
      partial => 1 );
    if ($gen_info_content) {
      push @plugin_general_information, $gen_info_content;
    }

  }

  $self->stash( plugin_tabs                => \@more_tabs );
  $self->stash( plugin_tab_content         => \@more_content );
  $self->stash( plugin_information_tab     => \@information_plugins );
  $self->stash( plugin_menus               => \@plugin_menus );
  $self->stash( plugin_filter              => \@plugin_filter );
  $self->stash( plugin_menu_configuration  => \@plugin_menu_configuration );
  $self->stash( plugin_general_information => \@plugin_general_information );

  $self->render;

}

# sub export {
#   my ($self) = @_;
#
#   $self->res->headers->header( "Content-Type" => "text/csv" );
#   $self->res->headers->header(
#     "Content-Disposition" => "attachment; filename=export-serverlist.csv" );
#   $self->res->headers->header(
#     "Content-Description" => "Server List in CSV Format" );
#   $self->res->headers->header( "Pragma"  => "no-cache" );
#   $self->res->headers->header( "Expires" => 0 );
#
#   my $qry = "" . $self->req->query_params;
#
#   my $server_list = $self->rexio->list_hosts($qry);
#   $self->stash( entries => $server_list );
#   $self->render;
# }

sub list {
  my ($self) = @_;

  if ( !$self->has_permission('UI_LIST_SERVER') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $qry = "" . $self->req->query_params;

  $self->app->log->debug("Got query parameters: $qry");

  my $server_list = $self->rexio->call(
    "GET", "1.0", "hardware",
    hardware => undef,
    ref      => $qry,
  );

  my (@plugin_filter);

  for my $plugin ( @{ $self->config->{plugins} } ) {

    my $template_path = "\L$plugin";

    my $filter_content =
      $self->render_to_string( "$template_path/ext/search", partial => 1 );
    if ($filter_content) {
      push @plugin_filter, $filter_content;
    }

  }

  $self->stash( entries => $server_list );

  #  $self->stash( os_templates  => $os_list );
  $self->stash( plugin_filter => \@plugin_filter );

  $self->render;
}

sub add {
  my ($self) = @_;
  if ( !$self->has_permission('UI_ADD_SERVER') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  $self->render;
}

sub add_new {
  my ($self) = @_;

  if ( !$self->has_permission('UI_ADD_SERVER') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $json = $self->req->json;

  $self->app->log->debug("Adding new server.");
  $self->app->log->debug( Dumper($json) );

  my $ret = $self->rexio->call(
    "POST", "1.0", "hardware",
    hardware => undef,
    ref      => $json->{data}
  );

  $self->app->log->debug( "Got server answer: " . Dumper($ret) );

  $self->render( json => $ret );
}

sub del_server {
  my ($self) = @_;

  if ( !$self->has_permission('UI_DELETE_SERVER') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $srv_id = $self->param("id");

  $self->app->log->debug("Deleting server: $srv_id");

  my $ret =
    $self->rexio->call( "DELETE", "1.0", "hardware", hardware => $srv_id );

  $self->app->log->debug( "Got server answer: " . Dumper($ret) );

  $self->render( json => $ret );
}

sub update_server {
  my ($self) = @_;

  if ( !$self->has_permission('UI_UPDATE_SERVER') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $ret = $self->rexio->call(
    "POST", "1.0", "hardware",
    hardware => $self->param("id"),
    ref      => $self->req->json->{data}
  );

  $self->render( json => $ret );
}

# sub trigger_inventory {
#   my ($self) = @_;
#
#   my $ret = $self->rexio->trigger_inventory( $self->param("ip") );
#
#   $self->render( json => $ret );
# }
#
# sub trigger_reboot {
#   my ($self) = @_;
#
#   my $ret = $self->rexio->trigger_reboot( $self->param("ip") );
#
#   $self->render( json => $ret );
# }

# sub bulk_view {
#   my ($self) = @_;
#   $self->render;
# }

# sub run_command {
#   my ($self) = @_;
#   $self->app->log->debug( "Sending command to: " . $self->param("ip") );
#   $self->app->log->debug( Dumper( $self->req->json ) );
#   $self->rexio->send_command_to( $self->param("ip"), $self->req->json );
#
#   $self->render( json => { ok => Mojo::JSON->true } );
# }

# sub group {
#   my ($self) = @_;
#   $self->render;
# }
#
# sub add_group {
#   my ($self) = @_;
#   my $ret = $self->rexio->add_server_group( %{ $self->req->json } );
#
#   $self->render( json => $ret );
# }
#
# sub del_group {
#   my ($self) = @_;
#   my $ret = $self->rexio->del_server_group( $self->param("group_id") );
#
#   $self->render( json => $ret );
# }
#
# sub add_server_to_group {
#   my ($self) = @_;
#   my $ret = $self->rexio->add_server_to_server_group( $self->param("server_id"),
#     $self->param("group_id") );
#
#   $self->render( json => $ret );
# }

##### Rex.IO WebUI Plugin specific methods
sub __register__ {
  my ( $self, $opt ) = @_;
  my $r      = $opt->{route};
  my $r_auth = $opt->{route_auth};
  my $app    = $opt->{app};

  $r->websocket("/server_events")->to("server#events");
  $r->websocket("/messagebroker")->to("server#messagebroker");

  #$r_auth->get("/server/export")->to("server#export");
  $r_auth->get("/server/new")->to("server#add");
  $r_auth->get("/server/bulk")->to("server#bulk_view");
  $r_auth->post("/server/new")->to("server#add_new");
  $r_auth->get("/server/:id")->to("server#index");
  $r_auth->delete("/server/:id")->to("server#del_server");
  $r_auth->post("/server/:id")->to("server#update_server");
  $r_auth->post("/server/#ip/inventory")->to("server#trigger_inventory");
  $r_auth->post("/server/#ip/reboot")->to("server#trigger_reboot");
  $r_auth->get("/server")->to("server#list");
  $r_auth->post("/network-adapter/:id")->to("server#update_network_adapter");
  $r_auth->get("/server_group")->to("server#group");
  $r_auth->post("/server_group")->to("server#add_group");
  $r_auth->delete("/server_group/:group_id")->to("server#del_group");
  $r_auth->post("/server_group/server/:server_id/:group_id")
    ->to("server#add_server_to_group");

  # set next boot // todo: andere url
  $r_auth->post("/server/:server/boot/:boot")->to("server#set_next_boot");
  $r_auth->route("/server/#ip/command")->via("RUN")->to("server#run_command");

  # new routes
  $r_auth->post("/1.0/server/server/:server/boot/:boot")
    ->to("server#set_next_boot");

  $r_auth->post("/1.0/server/server/:id")->to("server#update_server");

  $r_auth->delete("/1.0/server/server/:id")->to("server#del_server");

  $r_auth->post("/1.0/server/server")->to("server#add_new");

}

1;
