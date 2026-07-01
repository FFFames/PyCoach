alter table public.assignments
  add column if not exists rubric text,
  add column if not exists reference_solution text,
  add column if not exists hidden_tests jsonb;

insert into public.assignments (
  id, title, description, starter_code, difficulty, skill, tests,
  rubric, reference_solution, hidden_tests
) values
(
  'variables',
  'The Tip Splitter',
  $description$Read a bill total and a positive number of people, then print each person's equal share rounded to exactly two decimal places.$description$,
  E'bill = float(input())\npeople = int(input())\n\n# Calculate and print each person''s share\n',
  'Beginner',
  'variables',
  '[{"input":"100\n4","expected":"25.00"},{"input":"99\n3","expected":"33.00"}]'::jsonb,
  $rubric$Read both inputs, divide the bill by the number of people, and print only the share formatted to exactly two decimal places. Handle zero and decimal bill totals without hardcoding cases.$rubric$,
  E'bill = float(input())\npeople = int(input())\nprint(f"{bill / people:.2f}")',
  '[{"input":"10\n2","expected":"5.00"},{"input":"0\n5","expected":"0.00"},{"input":"87.5\n5","expected":"17.50"},{"input":"1\n8","expected":"0.12"}]'::jsonb
),
(
  'conditionals',
  'Ticket Booth',
  'Read an age. Print child for age under 13, teen for age 13 through 19 inclusive, and adult for age 20 or older.',
  E'age = int(input())\n\n# Print the correct ticket category\n',
  'Beginner',
  'conditionals',
  '[{"input":"12","expected":"child"},{"input":"13","expected":"teen"}]'::jsonb,
  'Read one integer age and print exactly child, teen, or adult using the stated boundaries: age < 13, 13 <= age <= 19, and age >= 20. Boundary values must be correct.',
  E'age = int(input())\nif age < 13:\n    print("child")\nelif age <= 19:\n    print("teen")\nelse:\n    print("adult")',
  '[{"input":"0","expected":"child"},{"input":"19","expected":"teen"},{"input":"20","expected":"adult"},{"input":"65","expected":"adult"}]'::jsonb
),
(
  'loops',
  'Fizz Counter',
  'Read a non-negative integer n and use a loop to print the sum of every integer from 1 through n. For n = 0, print 0.',
  E'n = int(input())\n\n# Use a loop to calculate the total\n',
  'Beginner',
  'loops',
  '[{"input":"5","expected":"15"},{"input":"1","expected":"1"}]'::jsonb,
  'Read n, initialize an accumulator, use iteration to add every integer from 1 through n inclusively, and print only the total. The zero case must produce 0.',
  E'n = int(input())\ntotal = 0\nfor value in range(1, n + 1):\n    total += value\nprint(total)',
  '[{"input":"10","expected":"55"},{"input":"0","expected":"0"},{"input":"2","expected":"3"},{"input":"100","expected":"5050"}]'::jsonb
),
(
  'lists',
  'Above Average',
  $description$Read one non-empty line of space-separated integers and print how many values are strictly greater than the list's arithmetic average.$description$,
  E'numbers = list(map(int, input().split()))\n\n# Count values above the average\n',
  'Intermediate',
  'lists',
  '[{"input":"1 2 3 4 5","expected":"2"},{"input":"10 10 10","expected":"0"}]'::jsonb,
  'Parse all integers into a list, compute their arithmetic average, count values strictly greater than that average, and print only the count. Equal-to-average values do not count; negative values and a single-item list must work.',
  E'numbers = list(map(int, input().split()))\naverage = sum(numbers) / len(numbers)\nprint(sum(1 for number in numbers if number > average))',
  '[{"input":"1 100 101","expected":"2"},{"input":"-1 0 1","expected":"1"},{"input":"5","expected":"0"},{"input":"-5 -1 -3","expected":"1"}]'::jsonb
),
(
  'functions',
  'Palindrome Lab',
  'Implement is_palindrome(text), then read one line and print True or False. Ignore letter case, spaces, and punctuation; an empty string is a palindrome.',
  E'def is_palindrome(text):\n    # Return whether text reads the same backwards\n    pass\n\ntext = input()\nprint(is_palindrome(text))\n',
  'Intermediate',
  'functions',
  '[{"input":"Racecar","expected":"True"},{"input":"hello","expected":"False"}]'::jsonb,
  'Define and call is_palindrome(text). Normalize by ignoring case and non-alphanumeric characters, compare the normalized text with its reverse, return a boolean, and print that boolean. Empty normalized text returns True.',
  E'def is_palindrome(text):\n    normalized = "".join(char.lower() for char in text if char.isalnum())\n    return normalized == normalized[::-1]\n\ntext = input()\nprint(is_palindrome(text))',
  '[{"input":"A man a plan a canal Panama","expected":"True"},{"input":"","expected":"True"},{"input":"12321","expected":"True"},{"input":"No lemon, no melon!","expected":"True"}]'::jsonb
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  starter_code = excluded.starter_code,
  difficulty = excluded.difficulty,
  skill = excluded.skill,
  tests = excluded.tests,
  rubric = excluded.rubric,
  reference_solution = excluded.reference_solution,
  hidden_tests = excluded.hidden_tests;

alter table public.assignments
  alter column rubric set default '',
  alter column rubric set not null,
  alter column reference_solution set default '',
  alter column reference_solution set not null,
  alter column hidden_tests set default '[]'::jsonb,
  alter column hidden_tests set not null;

alter table public.assignments
  add constraint assignments_tests_are_arrays
    check (jsonb_typeof(tests) = 'array' and jsonb_typeof(hidden_tests) = 'array');

-- Students can read assignment content and examples, but grading context stays
-- available only to the service-role client used by POST /api/grade.
revoke select on public.assignments from authenticated;
grant select (id, title, description, starter_code, difficulty, skill, tests, created_at)
  on public.assignments to authenticated;
