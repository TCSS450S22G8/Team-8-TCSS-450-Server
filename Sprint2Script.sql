-- Remove Users
--Remove the user sean
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='sean@test.com');
DELETE FROM Members 
WHERE Email='sean@test.com';

--Remove the user rin
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='rin@test.com');
DELETE FROM Members 
WHERE Email='rin@test.com';

--Remove the user levi
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='levi@test.com');
DELETE FROM Members 
WHERE Email='levi@test.com';

--Remove the user jenho
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='jenho@test.com');
DELETE FROM Members 
WHERE Email='jenho@test.com';

--Remove the user shilnara
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='shilnara@test.com');
DELETE FROM Members 
WHERE Email='shilnara@test.com';

-- --Remove the user charles
-- DELETE FROM Credentials 
-- WHERE MemberId IN 
--     (SELECT MemberID FROM Members WHERE Email='charles@test.com');
-- DELETE FROM Members 
-- WHERE Email='charles@test.com';



--Add the Users to the  (password is: test12345!)
INSERT INTO 
    Members(FirstName, LastName, Username, Email, Verification)
VALUES
    ('Sean', 'Logan', 'Seans', 'sean@test.com', 1),
    ('Rin', 'Pham', 'Rins', 'rin@test.com', 1),
    ('Shilnara', 'Dam', 'Shilnaras', 'shilnara@test.com', 1),
    ('JenHo', 'Liao', 'JenHos', 'jenho@test.com', 1),
    ('Levi', 'McCoy', 'Levis', 'levi@test.com', 1);
    -- ('Charles', 'Bryan', 'Charles', 'charles@test.com', 1)


--Adding Crentials for Sean
INSERT INTO 
    Credentials(MemberID, SaltedHash, Salt)
VALUES 
((SELECT MemberId FROM Members WHERE Members.Email = 'sean@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871'),
((SELECT MemberId FROM Members WHERE Members.Email = 'jenho@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871'),
((SELECT MemberId FROM Members WHERE Members.Email = 'levi@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871'),
((SELECT MemberId FROM Members WHERE Members.Email = 'shilnara@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871'),
((SELECT MemberId FROM Members WHERE Members.Email = 'rin@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871');
-- ((SELECT MemberId FROM Members WHERE Members.Email = 'charles@test.com')
--        '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27'
--        'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871')



--Create Chat Rooms
INSERT INTO
    Chats(ChatId, Owner, Group, Name)
VALUES
    (99, 1, 1,'Gaming'),
    (100, 2, 1, 'Studying'),
    (101, 3, 1, 'Coding Questions');




--Add users to the chat 1 gaming
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 99, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';
    -- OR Members.Email = 'charles@test.com';

--Add users to the chat 2 studying
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 100, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';
    -- OR Members.Email = 'charles@test.com';

--Add users to the chat 3 coding questions
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 101, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';
    -- OR Members.Email = 'charles@test.com';

