
Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-24.04"

  # Load balancer 1
  config.vm.define "lb-01" do |lb|
    lb.vm.hostname = "lb-01"
    lb.vm.network "private_network", ip: "192.168.56.10"

    lb.vm.provider "virtualbox" do |vb|
      vb.memory = 512
      vb.cpus = 1
    end
  end

  # Load balancer 2
  config.vm.define "lb-02" do |lb|
    lb.vm.hostname = "lb-02"
    lb.vm.network "private_network", ip: "192.168.56.11"

    lb.vm.provider "virtualbox" do |vb|
      vb.memory = 512
      vb.cpus = 1
    end
  end

  # React server 1
  config.vm.define "web-01" do |web|
    web.vm.hostname = "web-01"
    web.vm.network "private_network", ip: "192.168.56.20"

    web.vm.provider "virtualbox" do |vb|
      vb.memory = 1024
      vb.cpus = 1
    end
  end

  # React server 2
  config.vm.define "web-02" do |web|
    web.vm.hostname = "web-02"
    web.vm.network "private_network", ip: "192.168.56.21"

    web.vm.provider "virtualbox" do |vb|
      vb.memory = 1024
      vb.cpus = 1
    end
  end
end
