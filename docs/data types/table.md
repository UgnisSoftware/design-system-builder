
Example a table of people that have a text, number, boolean values:
```
|table| =

id  | name (text) | number (number) | isAdult (boolean) |
---------------------------------------------------------
ref | Jane        | 123             | true              |
ref | Grey        | 555             | true              |
ref | Fray        | 912             | false             |
```

Filter - leave only entries that do not match the predicate:
```

remove if                   -> table

// example
|table|
  remove if |name|
            equals _Jane_

// result
id  | name (text) | number (number) | isAdult (boolean) |
---------------------------------------------------------
ref | Grey        | 555             | true              |
ref | Fray        | 912             | false             |
```

Change every entry (map):
```
transform each ____ ...   -> table

// example
|table|
  transform each _|name|_ |number| |isAdult|     // each of them can branch... and use one in another...
                  toUpper   + 1      not

// result
id  | name (text) | number (number) | isAdult (boolean) |
---------------------------------------------------------
ref | JANE        | 124             | false             |
ref | GREY        | 556             | false             |
ref | FRAY        | 913             | true              |
```

Push new entry to the end:
```
push ...                   -> table

// example
|table|
  add _default(text)_ default(number) defaultBoolean

// result
id  | name (text) | number (number) | isAdult (boolean) |
---------------------------------------------------------
ref | JANE        | 124             | false             |
ref | Grey        | 555             | true              |
ref | Fray        | 912             | false             |
```

Update an existing entry:
```
update __id__ ...          -> table

// example
|table|
  update _ref_ _|name|_ |number| |isAdult|
                  toUpper   + 1      not

// result
id  | name (text) | number (number) | isAdult (boolean) |
---------------------------------------------------------
ref | JANE        | 124             | false             |
ref | Grey        | 555             | true              |
ref | Fray        | 912             | false             |
```

Delete an existing entry:
```
delete __id__              -> table

// example
|table|
  delete _ref_

// result
id  | name (text) | number (number) | isAdult (boolean) |
---------------------------------------------------------
ref | Grey        | 555             | true              |
ref | Fray        | 912             | false             |
```

still in question:
reduce?
at __position__            -> row
select __column__          -> column.type