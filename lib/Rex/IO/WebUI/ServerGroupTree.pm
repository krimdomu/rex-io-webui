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

sub __register__ {
  my ( $self, $opt ) = @_;
  my $r      = $opt->{route};
  my $r_auth = $opt->{route_auth};
  my $app    = $opt->{app};

  $r_auth->post("/1.0/server_group_tree/children/:node_id")
    ->to("server_group_tree#get_node");
}

1;
