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

  my %shared_data = $self->shared_data();
  $self->app->log->debug( "(before_plugin)" . Dumper( \%shared_data ) );

  my %ret;
  for my $plugin ( keys %{ $shared_data{loaded_plugins} } ) {
    if ( exists $shared_data{loaded_plugins}->{$plugin}->{hooks}->{consume} ) {
      for my $hook (
        @{ $shared_data{loaded_plugins}->{$plugin}->{hooks}->{consume} } )
      {
        if ( $hook->{plugin} eq $self->param("plugin")
          && $hook->{action} eq $self->param("symbol") )
        {
          if ( exists $hook->{call} ) {
            no strict 'refs';
            my $hook_function = $hook->{call};
            %ret = *{"$hook_function"}->($self);
          }
        }
      }
    }
  }

  for my $key ( keys %ret ) {
    my $current_data = $self->stash($key) || [];
    push @{$current_data}, $ret{$key};
    $self->stash( $key, $current_data );
  }

  return 1;
}

sub call_plugin {
  my $self = shift;

  $self->app->log->debug( "Calling plugin: " . $self->param("plugin") );
  $self->app->log->debug( "HTTP-Method: " . $self->req->method );

  my $config = $self->param("config");
  $self->app->log->debug( Dumper($config) );

  my %shared_data = $self->shared_data();
  $self->app->log->debug( Dumper( \%shared_data ) );

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

    my $meth = $self->req->method;
    my $tx =
      $ua->build_tx(
      $meth => $backend_url => { "Accept" => "application/json" } => json =>
        $self->req->json );

    # do an async call
    Mojo::IOLoop->delay(
      sub {
        $ua->start(
          $tx,
          sub {
            my ( $ua, $tx ) = @_;
            if ( $tx->success ) {
              $self->render( json => $tx->res->json );
            }
            else {
              my $ref = $tx->res->json;
              if ($ref) {
                $self->render( json => $ref );
              }
              else {
                $self->render( json =>
                    { ok => Mojo::JSON->false, error => "Unknown error." } );
              }
            }
          }
        );
      }
    );

    $self->render_later();
  }
}

1;
