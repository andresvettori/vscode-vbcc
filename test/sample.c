#include <stdio.h>
#include <gem.h>

int main(void)
{
    /* Initialize GEM */
    appl_init();
    
    /* Open virtual workstation */
    short work_in[11] = {1,1,1,1,1,1,1,1,1,1,2};
    short work_out[57];
    short handle = graf_handle(&work_out[0], &work_out[1], &work_out[2], &work_out[3]);
    v_opnvwk(work_in, &handle, work_out);
    
    /* Display alert box with message */
    form_alert(1, "[1][Hello, Atari ST!][OK]");
    
    /* Clean up */
    v_clsvwk(handle);
    appl_exit();
    
    return 0;
}
