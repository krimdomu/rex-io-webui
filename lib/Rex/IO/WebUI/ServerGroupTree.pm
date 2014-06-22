package Rex::IO::WebUI::ServerGroupTree;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

sub get_node {
  my ($self) = @_;

  $self->app->log->debug( "Getting children of " . $self->param("node_id") );

  my $ref = $self->rexio->call( "GET", "1.0", "server_group_tree",
    children => $self->param("node_id") );

  my @data = @{ $ref->{data} };

  map {
    $_->{text} = $_->{name};
    $_->{isFolder} =
      ( $_->{has_children} ? Mojo::JSON->true : Mojo::JSON->false );
    $_->{isLazy} =
      ( $_->{has_children} ? Mojo::JSON->true : Mojo::JSON->false );
    $_->{isExpanded} = Mojo::JSON->false;
    $_->{lazyUrl}    = "/1.0/server_group_tree/children/$_->{id}";
    $_->{node_id}    = $_->{id};
    $_->{id}         = "tree_node_$_->{id}";
  } @data;

  $self->render( json => \@data );
}

sub add_group {
  my ($self) = @_;

  $self->app->log->debug( "Adding new group: " . $self->req->json->{name} );
  my $ref = $self->rexio->call(
    "POST", "1.0", "server_group_tree",
    node => undef,
    ref  => $self->req->json->{data}
  );

  $self->render( json => $ref );
}

sub delete_group {
  my ($self) = @_;

  $self->app->log->debug( "Deleting group: " . $self->param("node_id") );

  my $ref = $self->rexio->call( "DELETE", "1.0", "server_group_tree",
    node => $self->param("node_id") );

  $self->render( json => $ref );
}

sub update_group {
  my ($self) = @_;

  $self->app->log->debug( "Updating group: " . $self->param("node_id") );
  my $ref = $self->rexio->call(
    "POST", "1.0", "server_group_tree",
    node => $self->param("node_id"),
    ref  => $self->req->json->{data}
  );

  $self->render( json => $ref );
}

sub __register__ {
  my ( $self, $opt ) = @_;
  my $r      = $opt->{route};
  my $r_auth = $opt->{route_auth};
  my $app    = $opt->{app};

  $r_auth->post("/1.0/server_group_tree/children/:node_id")
    ->to("server_group_tree#get_node");

  $r_auth->post("/1.0/server_group_tree/node")
    ->to("server_group_tree#add_group");

  $r_auth->post("/1.0/server_group_tree/node/:node_id")
    ->to("server_group_tree#update_group");

  $r_auth->delete("/1.0/server_group_tree/node/:node_id")
    ->to("server_group_tree#delete_group");
}

1;
