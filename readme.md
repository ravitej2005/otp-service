install Traccar SMS Gateway application - https://play.google.com/store/apps/details?id=org.traccar.gateway
open application , 
set application as default messaging application
go to settings -> Gateway configuration
in cloud service section copy token and paste in .env file

create a .env file in below format

SECRET_KEY=Qx7!mN#4vLp2@Zk8$Hs9Tf3&YwR6cD1*uJ
TRACCAR_TOKEN=<TRACCAR_TOKEN here>
PORT=3000
