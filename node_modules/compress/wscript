import Options
import os
from os import unlink, symlink, popen
from os.path import exists
from os import mkdir
from os.path import abspath

srcdir = "."
blddir = "build"
VERSION = "0.0.1"

def set_options(opt):
  opt.tool_options("compiler_cxx")
  opt.tool_options("compiler_cc")

def configure(conf):
  conf.check_tool("compiler_cxx")
  conf.check_tool("compiler_cc")
  conf.check_tool("node_addon")

  conf.check(lib='z', libpath=['/usr/lib', '/usr/local/lib'], uselib_store='ZLIB')

def build(bld):
  obj = bld.new_task_gen("cxx", "shlib", "node_addon")
  obj.target = "compress"
  obj.source = "compress.cc"
  obj.uselib = "ZLIB"

def shutdown():
  # HACK to get compress.node out of build directory.
  # better way to do this?
  if Options.commands['clean']:
    if exists('compress.node'): unlink('compress.node')
  else:
    if not exists('build/default'):
      mkdir('build/default')
    if exists('build/Release/compress.node') and not exists('build/default/compress.node'):
      symlink(os.getcwd()+'/build/Release/compress.node', 'build/default/compress.node')
