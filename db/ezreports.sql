create database ezreports;

use ezreports;

create table reports (
  uid varchar(36) not null default (UUID()),
  name varchar(150) not null,
  description varchar(3000) default null,
  author varchar(100) not null,
  created_on datetime not null default (now()),
  last_edited_on datetime default null,
  design_properties text not null comment '{"margins":[10,10,10,10],"grid":5,"filterParams":{},"sortingOrder":{},"datasources":{}}',
  template_path varchar(1000) not null,
  primary key (uid)
);

create table media (
  uid varchar(36) not null default (UUID()),
  name varchar(150) not null,
  original_name varchar(500) not null,
  description varchar(3000) default null,
  file_path varchar(1000) not null,
  title varchar(100) default null,
  mime_type varchar(100) not null,
  size int not null,
  author varchar(100) not null,
  created_on datetime not null default (now()),
  primary key (uid)
);