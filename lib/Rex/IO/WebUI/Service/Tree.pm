#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   
package Rex::IO::WebUI::Service::Tree;
use Mojo::Base 'Mojolicious::Controller';

use Mojo::JSON;
use Data::Dumper;

sub root {
   my $self = shift;

   my $all_service = $self->rexio->list_service()->{data};

   my @service_names = map { 
                              my $cur_service = $_;
                              {
                                 id    => $all_service->{$_}->{name},
                                 name  => $all_service->{$_}->{name},
                                 root_id => $all_service->{$_}->{name},
                                 module => "Service",
                                 hasChildren => Mojo::JSON->true,
                                 childrenRef => [
                                    map {
                                       {
                                          '$ref' => $cur_service . "/" . $_
                                       }
                                    } grep {
                                          # don't list name and type as children
                                          $_ ne "type" && $_ ne "name"
                                       } keys %{ $all_service->{$_} }
                                 ]
                              } } keys %{ $all_service };

   $self->render_json(\@service_names);
}

sub child {
   my $self = shift;

   my $service = $self->rexio->get_service($self->stash("name"));
   my @path = split("/", $self->req->url);
   my $path_str = $self->req->url;
   my ($key_str) = ($path_str =~ m{^/service/tree/(.*)$}); 

   # make a variable out of the path
   # eonar/service/ntp/configuration
   # $service->{service}->{ntp}->{configuration}
   my @eval_arr = split(/\//, $key_str);
   my $eval_str = '$service->';

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
      root_id     => $self->stash("name"),
      name        => $path[-1],
      module      => "Service_\u$path[4]",
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
