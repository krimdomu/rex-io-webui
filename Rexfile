#
# (c) Jan Gehring <jan.gehring@gmail.com>
#
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:
# vim: set ft=perl:

use Rex -feature => ['1.0', 'no_path_cleanup'];
use Rex::Ext::ParamLookup;
use Rex::Lang::Perl::Carton;

task "setup", sub {

  my $rexio_server   = param_lookup "rexio_server", "127.0.0.1:5000";
  
  my $log_file = param_lookup "log_file", "log/webui.log";

  file "webui.conf",
    content => template('@webui.conf.tpl'),
    mode    => '0640';

  carton "-install";

};


1;


__DATA__

@webui.conf.tpl
{
   server => {
      url      => "<%= $rexio_server %>",

      #ssl => {
      #   key => "/Users/jan/temp/rexssl/ca/private/test.key",
      #   cert => "/Users/jan/temp/rexssl/ca/certs/test.crt",
      #   ca => "/Users/jan/temp/rexssl/ca/certs/ca.crt",
      #},
   },

   session => {
      key => "Rex.IO.WebUI",
   },

   plugins => [
      # basic plugins
      "Dashboard",
      "Permission",
      "User",
      "Group",
   ],

};
@end
