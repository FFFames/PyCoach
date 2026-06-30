insert into public.assignments (id,title,description,starter_code,difficulty,skill,tests) values
('variables','The Tip Splitter','Read a bill and number of people, then print each share.','bill = float(input())\npeople = int(input())','Beginner','variables','[{"input":"100\\n4","expected":"25.00"}]'),
('conditionals','Ticket Booth','Print the ticket category for an age.','age = int(input())','Beginner','conditionals','[{"input":"15","expected":"teen"}]'),
('loops','Fizz Counter','Print the sum from 1 through n.','n = int(input())','Beginner','loops','[{"input":"5","expected":"15"}]'),
('lists','Above Average','Count values above their average.','numbers = list(map(int, input().split()))','Intermediate','lists','[{"input":"1 2 3 4 5","expected":"2"}]'),
('functions','Palindrome Lab','Implement is_palindrome.','def is_palindrome(text):\n    pass','Intermediate','functions','[{"input":"Racecar","expected":"True"}]')
on conflict (id) do nothing;
