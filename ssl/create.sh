#!/bin/bash

openssl \
req \
-x509 \
-nodes \
-days 365 \
-newkey rsa:2048 \
-keyout $PWD/httpd-selfsigned.key \
-out $PWD/httpd-selfsigned.crt \
-config <(cat openssl.cnf) \
-subj '/C=AU/ST=QLD/L=Brisbane/O=Example/OU=/CN=localhost/emailAddress=example@example.com'

openssl dhparam -out $PWD/dhparam.pem 2048

openssl x509 -in httpd-selfsigned.crt -text -noout
