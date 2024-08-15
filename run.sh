#!/bin/bash

print_message() {
  COLOR=$1
  MESSAGE=$2
  echo -e "\e[${COLOR}m${MESSAGE}\e[0m"
}

clear
print_message "34" "Compiling Bot Code..."
pkg . > /dev/null 2>&1
clear
print_message "32" "Compiled Bot."
sleep 1.5
clear
print_message "34" "Running Binary..."
./qrcodebot