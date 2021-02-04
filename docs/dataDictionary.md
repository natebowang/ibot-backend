@todo update according to ibot_postgres.sql
# subjects
id: 
name: 
teacher_id:
description:
record_status:
mtime:

# classes: 
id:
subject_id:
name:
start_date:
end_date:
weekday:
start_time:
class_duration: 
price_per_class:
stock:
record_status:
mtime:

# timetable:
id:
class_id:
start_time:
record_status:
mtime:

# teachers
id:
real_name:
record_status:
mtime:

# users
id:
pwd:
salt:
phone:
email:
login_method_id:
user_state:
record_status:
mtime:

# students
id:
real_name:
email:
phone:
record_status:
mtime:

# registration
id:
student_id:
variant_id:
registration_time:
record_status:
mtime:

# attendance
id:
student_id:
timetable_id:
attendance_state: 
record_status:
mtime:

# payments
id:
user_id:
amount:
payment_method_id:
payment_time:
record_status:
mtime:

# payment_methods
id:
name:
payment_type:
record_status:
mtime:
