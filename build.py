import subprocess
import sys

CMD_LIST = (
           ('Clean py~ files', 'find . -name "*.py~" -exec rm -rf {} \;'),
           ('Clean pyc files', 'find . -name "*.pyc" -exec rm -rf {} \;'),
           ('Building distribution', 'sh dist.sh'),
           ('Build tar file', 'tar -zcvf pureflasharray.tar.gz core sizer env_setup '
                                'manage.py requirement.txt')
           )

def exec_cmd():
    for (name, cmd) in CMD_LIST:
        sys.stdout.write(name + " - ")
        #    sys.stdout.flush()
        proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE)
        out, err = proc.communicate()
        if not err:
            sys.stdout.write("[OK]\n")
            sys.stdout.write(out)
            #sys.stdout.flush()
        else:
            sys.stdout.write("[ERROR]\n")
            sys.stdout.write(err)
            sys.stdout.flush()


exec_cmd()
