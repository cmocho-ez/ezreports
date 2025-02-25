create database if not exists ezreports;

use ezreports;

create table if not exists reports (
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

create table if not exists media (
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

delimiter //

create procedure if not exists sp_new_media (
  p_name varchar(150), 
  p_original_name varchar(500), 
  p_description varchar(3000), 
  p_file_path varchar(1000), 
  p_title varchar(100), 
  p_mime_type varchar(100), 
  p_size int, 
  p_author varchar(100))
  begin
    set @uid = UUID();

    insert into media (uid, name, original_name, description, file_path, title, mime_type, size, author)
      values (@uid, p_name, p_original_name, p_description, p_file_path, p_title, p_mime_type, p_size, p_author);

    select uid, name, original_name, description, title, mime_type, size, author from media where uid = @uid;
  end
//

delimiter ;