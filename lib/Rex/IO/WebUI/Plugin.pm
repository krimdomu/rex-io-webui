#
# (c) Jan Gehring <jan.gehring@gmail.com>
#
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:

package Rex::IO::WebUI::Plugin;

use Mojo::Base 'Mojolicious::Controller';
use Mojo::JSON "j";
use Mojo::UserAgent;

use Data::Dumper;

sub list {
  my ($self) = @_;
  $self->render( json => $self->config->{"plugins"} );
}

sub register {
  my ($self) = @_;

  $self->app->log->debug("Registering a new plugin...");

  my $ref = $self->req->json;
  $self->app->log->debug( Dumper($ref) );

  my $plugin_name = $ref->{name};

  if ( !$plugin_name ) {
    return $self->render(
      json => { ok => Mojo::JSON->false, error => "No plugin name specified." }
    );
  }

  my $plugin_methods = $ref->{methods};

  for my $meth ( @{$plugin_methods} ) {
    $meth->{plugin} = $plugin_name;
    $self->register_url($meth);
  }

  my $config = {
    config      => $ref,
    plugin_name => $plugin_name,
  };

  $self->register_plugin($config);

  $self->render( json => { ok => Mojo::JSON->true } );
}

sub before_plugin {
  my $self = shift;
  $self->app->log->debug("(before_plugin) Checking to run plugin code...");

  $self->app->log->debug(
    "(before_plugin) Calling controller: " . $self->param("plugin") );
  $self->app->log->debug(
    "(before_plugin) Calling action: " . $self->param("symbol") );

  #my %shared_data = $self->shared_data();
  #$self->app->log->debug( "(before_plugin)" . Dumper( \%shared_data ) );
  my $loaded_plugins = $self->shared_data("loaded_plugins");

  for my $plugin ( keys %{$loaded_plugins} ) {
    if ( exists $loaded_plugins->{$plugin}->{hooks}->{consume} ) {
      for my $hook ( @{ $loaded_plugins->{$plugin}->{hooks}->{consume} } ) {
        my %ret;
        if ( $hook->{plugin} eq $self->param("plugin")
          && $hook->{action} eq $self->param("symbol") )
        {
          if ( exists $hook->{call} ) {
            no strict 'refs';
            my $hook_function = $hook->{call};
            %ret = *{"$hook_function"}->($self);
          }
          elsif ( exists $hook->{location} ) {
            my $ua          = Mojo::UserAgent->new;
            my $backend_url = $hook->{location};
            $self->app->log->debug("(before_plugin) Backend-URL: $backend_url");

            my $meth = $self->req->method;
            $self->app->log->debug("(before_plugin) Requested Method: $meth");

            my $tx = $ua->build_tx(
              $meth => $backend_url => {
                "Accept" => "application/json",
                "X-RexIO-Permissions" =>
                  join( ",", @{ $self->session("permissions") } ),
                "X-RexIO-User"     => $self->session("user"),
                "X-RexIO-Password" => $self->session("password"),
                "X-RexIO-Server"   => $self->config->{server}->{url},
              } => json => $self->req->json
            );

            my $res_tx = $ua->start($tx);
            if ( $res_tx->success ) {
              my $ref = $res_tx->res->json;
              %ret = %{$ref};
            }
          }
        }

        for my $key ( keys %ret ) {
          my $current_data = $self->stash($key) || [];
          if ( !ref $ret{$key} ) {
            $ret{$key} = Mojo::ByteStream->new( $ret{$key} );
            push @{$current_data}, $ret{$key};
          }
          elsif ( ref $ret{$key} eq "ARRAY" ) {
            push @{$current_data}, @{ $ret{$key} };
          }
          else {
            push @{$current_data}, $ret{$key};
          }
          $self->stash( $key, $current_data );
        }
      }
    }
  }

  return 1;
}

sub call_plugin {
  my $self = shift;

  $self->app->log->debug( "Calling plugin: " . $self->param("plugin") );
  $self->app->log->debug( "HTTP-Method: " . $self->req->method );

  my $config = $self->param("config");
  $self->app->log->debug( Dumper($config) );

  #my %shared_data = $self->shared_data();
  #$self->app->log->debug( Dumper( \%shared_data ) );

  if ( exists $config->{action} ) {
    my $action_func = "$config->{controller}::$config->{action}";
    {
      no strict 'refs';
      $self->app->log->debug("Calling: $action_func");
      *{"$action_func"}->($self);
    }
  }

  if ( exists $config->{location} ) {
    my $ua          = Mojo::UserAgent->new;
    my $backend_url = $config->{location};
    $self->app->log->debug("Backend-URL: $backend_url");

    my @params = ( $config->{url} =~ m/:(\w+)/g );
    $self->app->log->debug( "Found Backend-Params: " . join( ", ", @params ) );

    for my $p (@params) {
      my $param_data = $self->param($p);
      if ( !$param_data ) {
        return $self->render(
          json => { ok => Mojo::JSON->false, message => "Invalid parameters." },
          status => 500
        );
      }
      $backend_url =~ s/:\Q$p\E/$param_data/;
    }
    $backend_url .= "?" . $self->req->url->query;
    $self->app->log->debug("Parsed-Backend-URL: $backend_url");

    my $meth = $self->req->method;
    my $tx   = $ua->build_tx(
      $meth => $backend_url => {
        "Accept" => "application/json",
        "X-RexIO-Permissions" =>
          join( ",", @{ $self->session("permissions") } ),
        "X-RexIO-User"     => $self->session("user"),
        "X-RexIO-Password" => $self->session("password"),
        "X-RexIO-Server"   => $self->config->{server}->{url},
      } => json => $self->req->json
    );

    my $tx_res = $ua->start($tx);
    if ( $tx_res->success ) {

      #$self->res($tx_res);
      #$self->res->headers($tx_res->res->headers());
      my $response_headers = $tx_res->res->headers->to_hash;
      delete $response_headers->{'Server'};
      delete $response_headers->{'Set-Cookie'};
      delete $response_headers->{'Content-Length'};
      delete $response_headers->{'Connection'};
      delete $response_headers->{'Keep-Alive'};
      delete $response_headers->{'Proxy-Authentication'};
      delete $response_headers->{'Proxy-Authorization'};
      delete $response_headers->{'TE'};
      delete $response_headers->{'Trailers'};
      delete $response_headers->{'Transfer-Encoding'};
      delete $response_headers->{'Upgrade'};

      for my $header ( keys %{$response_headers} ) {
        $self->res->headers->add(
          $header => $tx_res->res->headers->to_hash()->{$header} );
      }
      $self->render( data => $tx_res->res->body );

      #$self->render( json => $tx->res->json );
    }
    else {
      my $ref = $tx->res->json;
      if ($ref) {
        $self->render( json => $ref );
      }
      else {
        $self->render(
          json => { ok => Mojo::JSON->false, error => "Unknown error." } );
      }
    }
  }
}

1;
