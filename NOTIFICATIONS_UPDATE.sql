-- Allow admins to delete notifications
create policy "Admin delete access" 
  on notifications for delete 
  using (auth.role() = 'authenticated');
