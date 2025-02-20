create USER IF NOT exists 'ezreports_user' identified by '_QcKPKd57S7*6B4e@JTry4!';

grant all privileges on ezreports.* to 'ezreports_user';

REVOKE Alter ON ezreports.*
FROM
  'ezreports_user';

REVOKE Create ON ezreports.*
FROM
  'ezreports_user';

REVOKE Create view ON ezreports.*
FROM
  'ezreports_user';

REVOKE Drop ON ezreports.*
FROM
  'ezreports_user';

REVOKE Index ON ezreports.*
FROM
  'ezreports_user';

REVOKE Alter routine ON ezreports.*
FROM
  'ezreports_user';

REVOKE Create routine ON ezreports.*
FROM
  'ezreports_user';

flush privileges;