#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   
package Rex::IO::WebUI::Server::Tree;
use Mojo::Base 'Mojolicious::Controller';

use Mojo::JSON;
use Data::Dumper;

# This action will render a template
sub root {
   my $self = shift;

   my $all_server = $self->rexio->list_server()->{data};

   my @server_names = map { 
                              my $cur_server = $_;
                              {
                                 id    => $all_server->{$_}->{name},
                                 name  => $all_server->{$_}->{name},
                                 hasChildren => Mojo::JSON->true,
                                 childrenRef => [
                                    map {
                                       {
                                          '$ref' => $cur_server . "/" . $_
                                       }
                                    } keys %{ $all_server->{$_} }
                                 ]
                              } } keys %{ $all_server };

   $self->render_json(\@server_names);
}

sub child {
   my $self = shift;

   my $server = $self->rexio->get_server($self->stash("name"));
   my @path = split("/", $self->req->url);
   my $path_str = $self->req->url;
   my ($key_str) = ($path_str =~ m{^/server/tree/(.*)$}); 

   # make a variable out of the path
   # eonar/service/ntp/configuration
   # $server->{service}->{ntp}->{configuration}
   my @eval_arr = split(/\//, $key_str);
   my $eval_str = '$server->';

   shift @eval_arr;

   for my $t (@eval_arr) {
      if($t =~ m/^[a-zA-Z_0-9]+$/) {
         $eval_str .= '{' . $t . '}->'
      }
      else {
         $self->render_text("Wrong format", status => 500);
         return;
      }
   }

   $eval_str =~ s/\-\>$//;

   my $key = eval $eval_str;

   my $ret = {
      id          => $key_str,
      name        => $path[-1],
      hasChildren => (ref($key) eq "HASH" ? Mojo::JSON->true : Mojo::JSON->false),
      childrenRef => [
         map {
            {
               '$ref' => $key_str . "/" . $_
            }
         } (ref($key) eq "HASH" ? keys %{ $key } : ())
      ]
   };

   $self->render_json($ret);
}

1;
