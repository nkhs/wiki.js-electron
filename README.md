# I Found Solution
instead of running with mouse double click at File Explorer, 
i used windows command prompt,
and, from there, i can find error logs.

So, i found: the some relative path is not working, because, the electron pack source code with asar.

and, some file operate is not working, etc fs.read, fs.readDir.

https://stackoverflow.com/questions/37559596/cannot-access-files-inside-asar-archive-in-electron-app
, So, i removed solved this problem.