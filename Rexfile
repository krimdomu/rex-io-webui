#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ft=perl:
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   
use Rex::Apache::Build;

path "/opt/local/bin", "/usr/bin", "/usr/local/bin", "/bin", "/sbin", "/usr/sbin";

task build => sub {

   sass "assets/stylesheets",
      out => "public/stylesheets";

   sprocketize "assets/javascripts/*.js",
      out => "public/javascripts/webui.js";

};

task daemon => sub {
   
   needs "build";
   run "bin/rex_ioweb_ui daemon";

};

