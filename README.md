### RabbitMQ Installation

Install Erlang if not already installed:

    sudo apt install erlang

Install the RabbitMQ signing key and adds it to your list of trusted keys:

    wget -qO - https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | sudo apt-key add -

Add the Erlang and RabbitMQ repository from Bintray to your system's software sources list:

    echo "deb https://dl.bintray.com/rabbitmq-erlang/debian focal erlang" | sudo tee /etc/apt/sources.list.d/bintray.rabbitmq.list
    echo "deb https://dl.bintray.com/rabbitmq/debian focal main" | sudo tee -a /etc/apt/sources.list.d/bintray.rabbitmq.list
    sudo apt update

Install RabbitMQ :

    sudo apt install rabbitmq-server

Check status if it's running :

    sudo systemctl status rabbitmq-server

Enable the management plugin :

    sudo rabbitmq-plugins enable rabbitmq_management

Restart RabbitMQ to take changes :

    sudo systemctl restart rabbitmq-server

Visit http://localhost:15672 to confirm that Rabbitmq is installed on your system

### Security

Create a folder in /etc/rabbitmq/ :

     sudo mkdir /etc/rabbitmq/ssl
     cd /etc/rabbitmq/ssl

Generate a CA and use it to produce two certificate/key pairs, one for the server and another for clients:

    git clone https://github.com/rabbitmq/tls-gen tls-gen
    cd tls-gen/basic
    make PASSWORD=linkopus
    make verify
    make info
    ls -l ./result

Change the certificates name for easy use:

     sudo mv client_linkopus-Precision-3541_certificate.pem client_certificate.pem
     sudo mv client_linkopus-Precision-3541_key.pem client_private_key.pem
     sudo mv server_linkopus-Precision-3541_certificate.pem server_certificate.pem
     sudo mv server_linkopus-Precision-3541_key.pem server_private_key.pem

Change certificates permission:

    sudo chmod o+r client_certificate.pem
    sudo chmod o+r server_certificate.pem
    sudo chmod o+r client_private_key.pem
    sudo chmod o+r server_private_key.pem

Open the Rabbitmq configuration file :

    sudo nano /etc/rabbitmq/rabbitmq.conf

Copy and paste the configuration to enable ssl (CTRL+X to save):

    listeners.ssl.default = 5671
    ssl_options.cacertfile = /etc/rabbitmq/ssl/tls-gen/basic/result/ca_certificate.pem
    ssl_options.certfile= /etc/rabbitmq/ssl/tls-gen/basic/result/server_certificate.pem
    ssl_options.keyfile= /etc/rabbitmq/ssl/tls-gen/basic/result/server_private_key.pem
    ssl_options.versions.3 = tlsv1.2
    ssl_options.versions.4 = tlsv1.3
    ssl_options.password=linkopus
    auth_mechanisms.1 = PLAIN
    auth_mechanisms.2 = EXTERNAL
    ssl_options.verify  = verify_peer
    ssl_options.fail_if_no_peer_cert = true

Restart RabbitMQ to take changes :

    sudo systemctl restart rabbitmq-server




   

















