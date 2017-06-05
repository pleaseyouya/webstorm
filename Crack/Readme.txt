 1) Install the software.

 2) Copy the binary of the license server to a permanent
    directory, such as C:\dvt-jb-lic-server\ or 
    /opt/dvt-jb-lic-server/

 3) *nix:
   - Go to the directory, where you put the license
     server.

   - Execute, either as root or using sudo:

     dvt-jb_licsrv.[platform].[arch] -mode install

     where platform is your OS and arch is your system
     architecture. To uninstall, you can use -mode uninstall.
     This will install (depending on your service system)
     a new service.

   - Start this service using your standard service
     tools.

  5) Start the application and point it to the license server.
     If you are running the license server on the same host,
     you can point it to "http://127.0.0.1:1337". Otherwise, 
     use the ip or hostname of your license server.

